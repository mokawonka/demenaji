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

  def new_application_poster(poster, application, place)
    @poster      = poster
    @application = application
    @place       = place
    @applicant   = application.applicant
    mail(to: @poster.email, subject: "Nouvelle candidature pour \"#{@place.composed_title}\"")
  end

  def new_application_applicant(applicant, application, place)
    @applicant   = applicant
    @application = application
    @place       = place
    mail(to: @applicant.email, subject: "Votre candidature a bien été envoyée")
  end

  def application_invited(applicant, application, place)
    @applicant   = applicant
    @application = application
    @place       = place
    mail(to: @applicant.email, subject: "Bonne nouvelle ! Vous êtes invité pour \"#{@place.composed_title}\"")
  end

  def application_declined(applicant, application, place)
    @applicant   = applicant
    @application = application
    @place       = place
    mail(to: @applicant.email, subject: "Mise à jour de votre candidature pour \"#{@place.composed_title}\"")
  end

end