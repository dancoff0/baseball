class CreateDivisions < ActiveRecord::Migration
  def change
    create_table :divisions do |t|
      t.string :divisionName
      t.references :league, index: true

      t.timestamps
    end
  end
end
