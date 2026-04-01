# app/controllers/applications_controller.rb

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

    # ── Security checks ── (votre code existant)
    if @place.user_id == current_user.id
      flash[:alert] = 'Vous ne pouvez pas postuler à votre propre annonce.'
      redirect_to place_path(@place)
      return
    end

    if Application.exists?(place_id: @place.id, applicant_id: current_user.id)
      flash[:notice] = 'Vous avez déjà postulé à cette annonce.'
      redirect_to apply_path(@place)
      return
    end

    # ── Update user profile ──
    if params[:user].present?
      current_user.update(user_params)
    end

    # ── Create the application ──
    application = Application.new(
      application_params.merge(
        place_id:      @place.id,
        applicant_id:  current_user.id,
        status:        -1,
        creation_time: Time.current
      )
    )

    if application.save
      @place.increment!(:number_of_applicants)

      # === Message automatique au propriétaire ===
      poster = @place.user
      if poster != current_user
        conversation = Conversation.find_or_create_between(current_user, poster)
        auto_body = "Nouvelle candidature reçue pour votre annonce \"#{@place.composed_title}\". " \
                    "Vous pouvez la consulter dans Mes annonces rubrique Voir les candidatures."
        Message.create!(
          conversation: conversation,
          sender: current_user,
          body: auto_body
        )
      end
      # ===========================================

      flash[:notice] = "Votre candidature a été envoyée avec succès."

      redirect_to my_applications_path
    else
      flash[:alert] = 'Problème lors du traitement de votre candidature.'
      redirect_to apply_path(@place)
    end
  end


  def destroy
    application = Application.find(params[:id])
    return head :forbidden unless application.applicant_id == current_user.id

    application.destroy
    redirect_to my_applications_path
  end


  private

  def user_params
    params.require(:user).permit(
      :name,
      :email,
      :job_title,
      :phone_number,
      :profile_picture
    )
  end

  def application_params
    params.permit(
      :marital_status,
      :reference_phone,
      :desired_rental_duration,
      :has_pets,
      :details
    )
  end
end