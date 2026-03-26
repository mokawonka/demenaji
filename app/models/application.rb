class Application < ApplicationRecord
  belongs_to :place
  belongs_to :applicant, class_name: 'User', foreign_key: :applicant_id, inverse_of: :applications

  validates :status, presence: true

  scope :for_user, ->(user_id) { where(applicant_id: user_id).order(created_at: :desc) }
  scope :for_place, ->(place_id) { where(place_id: place_id).includes(:applicant).order(created_at: :desc) }
end
