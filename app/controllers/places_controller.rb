class PlacesController < ApplicationController
  before_action :set_place, only: %i[show update destroy post_handler]
  before_action :require_login, only: %i[new create update destroy post_handler]

  def index; end

  def map_handler
    case params[:handler]
    when 'Area'
      render partial: 'partial_list', locals: { selected_places: selected_places_from_lookup }
    when 'AddFavorite'
      toggle_favorite(true, params[:favid])
      head :ok
    when 'RemoveFavorite'
      toggle_favorite(false, params[:favid])
      head :ok
    else
      head :unprocessable_entity
    end
  end



  def show
    if !signed_in? || current_user.id != @place.user_id
      @place.increment!(:visitor_count)
    end
    @is_faved = signed_in? && Favorite.exists?(user_id: current_user.id, place_id: @place.id)
    @user_is_owner = signed_in? && current_user.id == @place.user_id
  end



  def post_handler
    case params[:handler]
    when 'AddFavorite'
      toggle_favorite(true, params[:favid])
      head :ok
    when 'RemoveFavorite'
      toggle_favorite(false, params[:favid])
      head :ok
    else
      if @place.user_id == current_user.id
        flash[:alert] = 'You cannot apply to your own place.'
        redirect_to place_path(@place)
      elsif Application.exists?(place_id: @place.id, applicant_id: current_user.id)
        flash[:notice] = 'You have already applied to this place.'
        redirect_to place_path(@place)
      else
        redirect_to apply_path(@place)
      end
    end
  end



  def new
    if params[:id].present?
      @place = Place.find_by(id: params[:id])
      if @place.nil? || @place.user_id != current_user.id
        redirect_to(create_place_path) and return
      end
    else
      @place = Place.new
    end
  end



  def create
    @place = current_user.places.build(place_params)
    @place.post_date = Time.current
    @place.deletion_date_time = Time.at(0)
    @place.number_of_applicants = 0
    @place.visitor_count = 0

    if @place.save
      persist_uploaded_images(@place)
      flash[:notice] = 'Place successfully added.'
      redirect_to create_place_path(id: @place.id)
    else
      render :new, status: :unprocessable_entity
    end
  end



  def update
    return redirect_to(create_place_path) unless @place.user_id == current_user.id

    if @place.update(place_params)
      @place.place_pictures.destroy_all if params[:picture_files].present?
      persist_uploaded_images(@place)
      flash[:notice] = 'Changes saved.'
      redirect_to create_place_path(id: @place.id)
    else
      @place = Place.find(@place.id)
      render :new, status: :unprocessable_entity
    end
  end



  def destroy
    @place.destroy if @place.user_id == current_user.id
    redirect_to my_places_path
  end



  private

  def set_place
    @place = Place.includes(:place_pictures, :user).find(params[:id])
  end

  def place_params
    params.require(:place).permit(:address, :gps_latitude, :gps_longitude, :rent, :bedrooms, :description)
  end


  def persist_uploaded_images(place)
    return unless params[:picture_files].present?

    Array(params[:picture_files]).each_with_index do |file, i|
      next unless file.content_type&.start_with?('image/')

      if file.size > 8.megabytes
        flash.now[:alert] ||= "One or more images are too big (max 8MB)"
        next
      end

      place_picture = place.place_pictures.create!(pic_order: i)
      place_picture.picture.attach(file)
    end
  end


  def selected_places_from_lookup
    payload = JSON.parse(params[:lookuparea] || '{}')
    ne = payload['nebb'] || [180, 90]
    sw = payload['swbb'] || [-180, -90]

    places = Place
      .where(gps_longitude: sw[0]..ne[0])
      .where(gps_latitude: sw[1]..ne[1])
      .includes(:place_pictures)
      .limit(200)

    puts "#{places.count}\n" *20

    places.map do |place|
      {
        place: place,
        is_faved: signed_in? && Favorite.exists?(user_id: current_user.id, place_id: place.id)
      }
    end
  end

  def toggle_favorite(add, raw_place_id)
    place = Place.find_by(id: raw_place_id)
    return unless place

    if add
      Favorite.find_or_create_by!(user_id: current_user.id, place_id: place.id)
    else
      Favorite.where(user_id: current_user.id, place_id: place.id).delete_all
    end
  end
  
end
