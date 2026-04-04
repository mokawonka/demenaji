class UserMailer < ApplicationMailer

  def password_reset(user)
    @user = user
    mail to: @user.email, subject: "Réinitialisation de votre mot de passe"
  end

  def delete_account(user)
    @user = user
    mail to: @user.email, subject: "Votre compte a été supprimé"
  end

  def welcome(user)
    @user = user
    mail to: @user.email, subject: "Bienvenue sur Demenaji"
  end

  def new_message(recipient, message)
    @recipient = recipient
    @message   = message
    @sender    = message.sender
    @conversation = message.conversation
    mail(to: @recipient.email, subject: "#{@sender.name} vous a envoyé un message")
  end


end