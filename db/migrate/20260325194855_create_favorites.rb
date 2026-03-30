class CreateFavorites < ActiveRecord::Migration[8.1]
  def change
    create_table :favorites, id: :uuid do |t|
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.references :place, null: false, foreign_key: true, type: :uuid

      t.timestamps
    end
    add_index :favorites, %i[user_id place_id], unique: true
  end
end
