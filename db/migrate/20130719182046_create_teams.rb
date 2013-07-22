class CreateTeams < ActiveRecord::Migration
  def change
    create_table :teams do |t|
      t.string :teamCity
      t.string :teamName
      t.references :division, index: true

      t.timestamps
    end
  end
end
