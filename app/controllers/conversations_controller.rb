class ConversationsController < ApplicationController
  before_action :require_login

  def index
    # La bulle rouge disparaît immédiatement
    current_user.mark_all_messages_as_read!

    @conversations = current_user.conversations
                                 .includes(:user1, :user2, messages: :sender)
                                 .order(updated_at: :desc)
  end

  def show
    @conversation = Conversation.find(params[:id])
    # Sécurité : l'utilisateur doit faire partie de la conversation
    unless [@conversation.user1_id, @conversation.user2_id].include?(current_user.id)
      redirect_to conversations_path, alert: "Accès refusé."
      return
    end

    @other_user = @conversation.user1_id == current_user.id ? @conversation.user2 : @conversation.user1
    @messages = @conversation.messages.order(created_at: :asc)
  end
  
end