class PlacePicture < ApplicationRecord
  belongs_to :place

  has_one_attached :picture   # ← This is the new Active Storage attachment

  # Keep your ordering
  default_scope { order(:pic_order) }

  # Optional: helper for display (you can remove the old inline_src method)
  def display_url
    picture.variant(resize_to_limit: [1200, 1200], quality: 85).processed.url
  end

  # Optional: small thumbnail for lists
  def thumbnail_url
    picture.variant(resize_to_limit: [300, 300], quality: 80).processed.url
  end
end