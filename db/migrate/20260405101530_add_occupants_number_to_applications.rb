class AddOccupantsNumberToApplications < ActiveRecord::Migration[8.1]
  def change
    add_column :applications, :occupants_number, :integer
  end
end
