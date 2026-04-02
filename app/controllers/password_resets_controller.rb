class PasswordResetsController < ApplicationController
  def new
  end

  def create
    @user = User.find_by(email: params[:email]&.downcase)

    if @user
      UserMailer.password_reset(@user).deliver_now
    end

    flash[:notice] = "Un email de réinitialisation de mot de passe a été envoyé si l’adresse existe."
    redirect_to "/login"
  end

  def edit
    @user = User.find_signed(params[:token], purpose: "password_reset")

    if @user.nil?
      flash[:alert] = "Le lien de réinitialisation est invalide ou expiré."
      redirect_to forgot_password_path
      return
    end
  end

  def update
    @user = User.find_signed(params[:token], purpose: "password_reset")

    if @user.nil?
      flash[:alert] = "Le lien de réinitialisation est invalide ou expiré."
      redirect_to forgot_password_path
      return
    end

    if @user.update(reset_params)
      flash[:notice] = "Votre mot de passe a été réinitialisé avec succès."
      session[:user_id] = @user.id
      redirect_to root_path
    else
      flash.now[:alert] = @user.errors.full_messages.join(", ")
      render :edit, status: :unprocessable_entity
    end
  end

  private

  def reset_params
    params.require(:user).permit(:password, :password_confirmation)
  end
end