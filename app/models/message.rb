class Message < ApplicationRecord
  belongs_to :conversation
  belongs_to :sender, class_name: "User"

  validates :body, presence: true
  
  scope :unread, -> { where(read_at: nil) }
end