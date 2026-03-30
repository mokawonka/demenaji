class User < ApplicationRecord
  has_secure_password

  has_one_attached :profile_picture

  has_many :places, dependent: :destroy
  has_many :applications, foreign_key: :applicant_id, dependent: :destroy, inverse_of: :applicant
  has_many :favorites, dependent: :destroy
  has_many :favorite_places, through: :favorites, source: :place

  validates :email, presence: true, uniqueness: true
  validates :name, presence: true
end
