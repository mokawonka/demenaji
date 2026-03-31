class Place < ApplicationRecord
  belongs_to :user
  has_many :place_pictures, -> { order(:pic_order) }, dependent: :destroy
  has_many :applications, dependent: :destroy
  has_many :favorites, dependent: :destroy

  validates :address, presence: true
  validates :gps_latitude, :gps_longitude, presence: { message: "L'adresse doit exister. Veuillez sélectionner une adresse valide." }
  validates :description, presence: true
  validates :rent, presence: true

  validates :rent, numericality: { greater_than_or_equal_to: 0 }
  validates :bedrooms, numericality: { only_integer: true, greater_than_or_equal_to: 0 }

  def bedroom_label
    return 'Studio' if bedrooms.to_i.zero?
    return '1 Pièce' if bedrooms.to_i == 1

    "#{bedrooms} Pièces"
  end

  def composed_title
    formatted_rent = rent.to_s.reverse.gsub(/(\d{3})(?=\d)/, '\\1 ').reverse
    "#{formatted_rent} DA | #{bedroom_label} | #{address}"
  end
end
