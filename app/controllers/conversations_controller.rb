class ConversationsController < ApplicationController
  before_action :require_login
  before_action :set_conversation, only: [:show]

  def index
    @conversations = current_user
      .conversations
      .includes(:user1, :user2, :messages)
      .order("messages.created_at DESC")

    # If a conversation_id param is given (or Turbo frame request),
    # pre-load that conversation too
    if params[:conversation_id].present?
      @conversation = @conversations.find_by(id: params[:conversation_id])
      load_messages if @conversation
    end
  end

  def show
    @conversations = current_user
      .conversations
      .includes(:user1, :user2, :messages)
      .order("messages.created_at DESC")

    load_messages

    # Mark messages as read
    @conversation.messages
      .unread
      .where.not(sender_id: current_user.id)
      .update_all(read_at: Time.current)

    respond_to do |format|
      format.html { render :index }          # full page (direct URL visit)
      format.turbo_stream                     # Turbo frame swap (AJAX click)
    end
  end

  private

  def set_conversation
    @conversation = current_user.conversations.find_by(id: params[:id])
    if @conversation.nil?
      redirect_to conversations_path, alert: "Cette conversation n'existe plus."
    end
  end

  def load_messages
    @messages   = @conversation.messages.order(:created_at)
    @other_user = @conversation.user1_id == current_user.id \
                  ? @conversation.user2 \
                  : @conversation.user1
  rescue ActiveRecord::RecordNotFound
    redirect_to conversations_path, alert: "Cette conversation n'existe plus."
  end
  
end