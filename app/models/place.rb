class Place < ApplicationRecord
  belongs_to :user
  has_many :place_pictures, -> { order(:pic_order) }, dependent: :destroy
  has_many :applications, dependent: :destroy
  has_many :favorites, dependent: :destroy

  validates :address, :gps_latitude, :gps_longitude, :description, :rent, presence: true
  validates :rent, numericality: { greater_than_or_equal_to: 0 }
  validates :bedrooms, numericality: { only_integer: true, greater_than_or_equal_to: 0 }

  def bedroom_label
    return 'Studio' if bedrooms.to_i.zero?
    return '1 Pièce' if bedrooms.to_i == 1

    "#{bedrooms} Pièces"
  end

  def composed_title
    "#{rent} DA | #{bedroom_label} | #{address}"
  end
end
