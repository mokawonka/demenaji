class CreatePlaces < ActiveRecord::Migration[8.1]
  def change
    create_table :places, id: :uuid do |t|
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.string :address, null: false
      t.float :gps_latitude, null: false
      t.float :gps_longitude, null: false
      t.text :description, null: false
      t.integer :rent, null: false
      t.integer :bedrooms, null: false, default: 0
      t.integer :visitor_count, null: false, default: 0
      t.integer :number_of_applicants, null: false, default: 0
      t.datetime :post_date, null: false
      t.datetime :deletion_date_time, null: false

      t.timestamps
    end
  end
end
