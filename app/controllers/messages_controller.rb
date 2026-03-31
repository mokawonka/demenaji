class MessagesController < ApplicationController
  before_action :require_login

  def create
    recipient = User.find(params[:recipient_id])

    if recipient == current_user
      flash[:alert] = "Vous ne pouvez pas vous envoyer un message à vous-même."
      redirect_to request.referrer || root_path
      return
    end

    conversation = Conversation.find_or_create_between(current_user, recipient)

    @message = Message.new(
      body:        params[:body],          
      sender:      current_user,
      conversation: conversation
    )

    if @message.save
      flash[:message_sent] = "Votre message a été envoyé avec succès !"
      redirect_to request.referrer || conversations_path
    else
      flash[:alert] = "Erreur lors de l'envoi du message."
      redirect_to request.referrer || root_path
    end
  end
end