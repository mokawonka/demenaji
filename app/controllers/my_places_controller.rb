class MyPlacesController < ApplicationController
  before_action :require_login

  def index
    @my_places = current_user.places.includes(:place_pictures, applications: :applicant)
  end

  def invite
    update_status(params[:id], params[:query], 1)
  end

  def decline
    update_status(params[:id], params[:query], 0)
  end

  def request_payment
    app = update_status(params[:id], params[:query], 2)
    Application.where(place_id: params[:id]).where.not(id: app.id).update_all(status: -2) if app
  end

  def cancel_payment_request
    app = update_status(params[:id], params[:query], -1)
    Application.where(place_id: params[:id]).where.not(id: app.id).update_all(status: -1) if app
  end

  private

  def update_status(place_id, application_id, status)
    place = current_user.places.find_by(id: place_id)
    app = place&.applications&.find_by(id: application_id)
    app&.update(status: status)
    redirect_to my_places_path
    app
  end
end
