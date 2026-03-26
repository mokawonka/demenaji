class PlacePicture < ApplicationRecord
  belongs_to :place

  has_one_attached :picture  

  default_scope { order(:pic_order) }

  def display_url
    picture.variant(resize_to_limit: [1200, 1200])
  end

  def thumbnail_url
    picture.variant(resize_to_limit: [400, 400])
  end
end