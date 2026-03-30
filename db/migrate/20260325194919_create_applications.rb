class CreateApplications < ActiveRecord::Migration[8.1]
  def change
    create_table :applications, id: :uuid do |t|
      t.references :place, null: false, foreign_key: true, type: :uuid
      t.references :applicant, null: false, foreign_key: { to_table: :users }, type: :uuid
      t.integer :status, null: false, default: -1
      t.datetime :creation_time, null: false

      t.string :marital_status
      t.string :reference_phone
      t.integer :desired_rental_duration
      t.boolean :has_pets, default: false
      t.text :details

      t.timestamps
    end
    add_index :applications, %i[place_id applicant_id], unique: true
  end
end