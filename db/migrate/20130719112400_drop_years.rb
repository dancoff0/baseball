class DropYears < ActiveRecord::Migration
  def up
    drop_table :years
  end

  def down
    create_table :years do |t|
      t.integer :year

      t.timestamps
    end
  end

end
