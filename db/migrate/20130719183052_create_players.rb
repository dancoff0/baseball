class CreatePlayers < ActiveRecord::Migration
  def change
    create_table :players do |t|
      t.string :surName
      t.string :givenName
      t.integer :atBat
      t.integer :run
      t.integer :hit
      t.integer :homeRun
      t.integer :rbi
      t.integer :steal
      t.integer :sacrificeFly
      t.integer :walk
      t.integer :bean
      t.references :team, index: true

      t.timestamps
    end
  end
end
