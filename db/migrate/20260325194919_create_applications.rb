class CreateApplications < ActiveRecord::Migration[8.1]
  def change
    create_table :applications do |t|
      t.references :place, null: false, foreign_key: true
      t.references :applicant, null: false, foreign_key: { to_table: :users }
      t.text :details
      t.integer :status, null: false, default: -1
      t.datetime :creation_time, null: false

      t.timestamps
    end
    add_index :applications, %i[place_id applicant_id], unique: true
  end
end
