class User < ApplicationRecord
  has_secure_password

  has_one_attached :profile_picture

  has_many :places, dependent: :destroy
  has_many :applications, foreign_key: :applicant_id, dependent: :destroy, inverse_of: :applicant
  has_many :favorites, dependent: :destroy
  has_many :favorite_places, through: :favorites, source: :place

  validates :email, presence: true, uniqueness: true
  validates :name, presence: true


  has_many :conversations_as_user1, class_name: "Conversation", foreign_key: :user1_id, dependent: :destroy
  has_many :conversations_as_user2, class_name: "Conversation", foreign_key: :user2_id, dependent: :destroy

  def conversations
    Conversation.where(user1_id: id).or(Conversation.where(user2_id: id))
  end

  def unread_messages
    Message.where(conversation_id: conversations.select(:id))
           .where.not(sender_id: id)
           .where(read_at: nil)
  end

  def unread_messages_count
    unread_messages.count
  end

  def mark_all_messages_as_read!
    unread_messages.update_all(read_at: Time.current)
  end

  # Optionnel : dernier message pour l'affichage des conversations
  def last_message_in(conversation)
    conversation.messages.order(created_at: :desc).first
  end
  
end
