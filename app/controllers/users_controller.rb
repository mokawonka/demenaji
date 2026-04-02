class UsersController < ApplicationController
  
  def new
    @user = User.new
  end


  def create
    @user = User.new(user_params)
    @user.email = @user.email.to_s.downcase
    @user.name  = @user.email.split("@").first

    if @user.save
      session[:user_id] = @user.id
      redirect_to root_path
    else
      render :new, status: :unprocessable_entity
    end
  end


  def my_profile
    @user = current_user
  end


  def update_profile
    @user = current_user

    if @user.update(user_params)
      flash[:notice] = 'Profil mis à jour avec succès.'
      redirect_to my_profile_path
    else
      flash.now[:alert] = @user.errors.full_messages.join(', ')
      render :my_profile, status: :unprocessable_entity
    end
  end


  def settings
    @user = current_user
  end


  def update_password
    if current_user.authenticate(params[:current_password])
      if params[:password] == params[:password_confirmation]
        current_user.update!(password: params[:password])
        redirect_to settings_path, notice: 'Mot de passe mis à jour.'
      else
        redirect_to settings_path, alert: 'Les mots de passe ne correspondent pas.'
      end
    else
      redirect_to settings_path, alert: 'Mot de passe actuel incorrect.'
    end
  end


  def update_notifications
    current_user.update(email_notifications: !current_user.email_notifications)
    redirect_to settings_path, notice: 'Préférences de notification mises à jour.'
  end


  def delete_account
    current_user.destroy
    session.delete(:user_id)
    redirect_to root_path, notice: 'Votre compte a été supprimé.'
  end

  private

  def user_params
    params.require(:user).permit(:name, :email, :password, :password_confirmation,
                                  :profile_picture, :job_title, :phone_number, :email_notifications)
  end
end
