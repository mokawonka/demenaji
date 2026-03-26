class FavoritesController < ApplicationController
  before_action :require_login

  def index
    @favorites = current_user.favorites.includes(place: :place_pictures)
  end

  def destroy
    current_user.favorites.where(place_id: params[:fav]).delete_all
    redirect_to favorites_path
  end
end
