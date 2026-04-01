class MessagesController < ApplicationController
  before_action :require_login

  def create
    @conversation = find_or_create_conversation
    @message = @conversation.messages.build(
      body:      message_params[:body],
      sender_id: current_user.id
    )

    if @message.save
      respond_to do |format|
        format.json do
          render json: {
            id:              @message.id,
            body:            @message.body,
            is_mine:         true,
            time:            @message.created_at.strftime("%H:%M"),
            sender_initials: current_user.name.split.map(&:first).first(2).join.upcase
          }
        end
        format.html { redirect_to conversation_path(@conversation) }
      end
    else
      respond_to do |format|
        format.json { render json: { errors: @message.errors.full_messages }, status: :unprocessable_entity }
        format.html { redirect_to conversation_path(@conversation), alert: "Message invalide." }
      end
    end
  end

  private

  def message_params
    params.require(:message).permit(:body, :recipient_id, :conversation_id)
  end

  def find_or_create_conversation
    if message_params[:conversation_id].present?
      current_user.conversations.find(message_params[:conversation_id])
    else
      recipient = User.find(message_params[:recipient_id])
      Conversation.find_or_create_between(current_user, recipient)
    end
  end
end