class MyPlacesController < ApplicationController
  before_action :require_login

  def index
    @my_places = current_user.places.includes(:place_pictures, applications: :applicant)
  end


  def invite
    update_status(params[:id], params[:query], 1, "Candidature acceptée → candidat invité !")
  end


  def decline
    update_status(params[:id], params[:query], 0, "Candidature refusée.")
  end


  def applications
    @place = Place.find(params[:id])

    # Security: only the owner can see the applications
    unless @place.user_id == current_user.id
      flash[:alert] = "Vous n'êtes pas autorisé à voir ces candidatures."
      redirect_to my_places_path
      return
    end

    @applications = @place.applications
                         .includes(:applicant)
                         .order(created_at: :desc)
  end

  
  private

  def update_status(place_id, application_id, new_status, success_message)
    place = current_user.places.find_by(id: place_id)
    app   = place&.applications&.find_by(id: application_id)

    if app
      app.update(status: new_status)

      applicant = app.applicant
      if applicant.email_notifications?
        if new_status == 1
          UserMailer.application_invited(applicant, app, place).deliver_later
        else
          UserMailer.application_declined(applicant, app, place).deliver_later
        end
      end

      flash[:notice] = success_message
    else
      flash[:alert] = "Candidature introuvable."
    end

    redirect_to place_applications_path(place_id)
  end

end