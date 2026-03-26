class ApplicationsController < ApplicationController
  before_action :require_login

  def index
    @applications = Application.for_user(current_user.id).includes(:place)
  end

  def new
    @place = Place.find(params[:place_id])
  end

  def create
    @place = Place.find(params[:place_id])

    if @place.user_id == current_user.id
      flash[:alert] = 'You cannot apply to your own place.'
      redirect_to place_path(@place)
      return
    end

    if Application.exists?(place_id: @place.id, applicant_id: current_user.id)
      flash[:notice] = 'You have already applied to this place. Delete it from My Applications if needed.'
      redirect_to apply_path(@place)
      return
    end

    application = Application.new(
      place_id: @place.id,
      applicant_id: current_user.id,
      details: params[:details],
      status: -1,
      creation_time: Time.current
    )

    if application.save
      @place.increment!(:number_of_applicants)
      current_user.update(job_title: params[:job_title]) if params[:job_title].present?
      flash[:notice] = 'The poster will evaluate your application before scheduling a visit.'
    else
      flash[:alert] = 'Unable to submit your application.'
    end

    redirect_to apply_path(@place)
  end

  def destroy
    application = Application.find(params[:id])
    return head :forbidden unless application.applicant_id == current_user.id

    application.destroy
    redirect_to my_applications_path
  end
end
