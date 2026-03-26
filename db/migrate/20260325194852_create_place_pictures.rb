class CreatePlacePictures < ActiveRecord::Migration[8.1]
  def change
    create_table :place_pictures do |t|
      t.references :place, null: false, foreign_key: true
      t.integer :pic_order, null: false, default: 0

      t.timestamps
    end
    add_index :place_pictures, [:place_id, :pic_order]
  end
end