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

  def formatted_rent
    r = rent.to_i
    if r >= 10_000_000 && (r % 10_000_000).zero?
      "#{r / 10_000_000} Milliard#{r / 10_000_000 > 1 ? 's' : ''}"
    elsif r >= 10_000_000
      whole = r / 10_000_000
      remainder = (r % 10_000_000) / 1_000_000
      remainder.zero? ? "#{whole} Milliard#{whole > 1 ? 's' : ''}" : "#{whole},#{remainder} Milliards"
    elsif r >= 10_000 && (r % 10_000).zero?
      "#{r / 10_000} Million#{r / 10_000 > 1 ? 's' : ''}"
    elsif r >= 10_000
      whole = r / 10_000
      remainder = (r % 10_000) / 1_000
      remainder.zero? ? "#{whole} Million#{whole > 1 ? 's' : ''}" : "#{whole},#{remainder} Millions"
    else
      "#{r.to_s.reverse.gsub(/(\d{3})(?=\d)/, '\\1 ').reverse} DA"
    end
  end

  def composed_title
    "#{formatted_rent} | #{bedroom_label} | #{address}"
  end
end
