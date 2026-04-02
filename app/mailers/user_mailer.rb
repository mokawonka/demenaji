class UserMailer < ApplicationMailer

  def password_reset(user)
    @user = user
    mail to: @user.email,
         subject: "Réinitialisation de votre mot de passe"
  end

end