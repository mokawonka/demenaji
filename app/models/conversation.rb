class Conversation < ApplicationRecord
  belongs_to :user1, class_name: "User"
  belongs_to :user2, class_name: "User"
  has_many :messages, dependent: :destroy

  validates :user1_id, uniqueness: { scope: :user2_id }

  before_validation :normalize_users

  def self.find_or_create_between(user_a, user_b)
    return nil if user_a == user_b
    u1, u2 = [user_a, user_b].sort_by(&:id)
    where(user1_id: u1.id, user2_id: u2.id).first || create!(user1_id: u1.id, user2_id: u2.id)
  end

  private

  def normalize_users
    return unless user1_id && user2_id
    self.user1_id, self.user2_id = user2_id, user1_id if user1_id > user2_id
  end
end