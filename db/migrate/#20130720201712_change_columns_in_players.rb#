class ChangeColumnsInPlayers < ActiveRecord::Migration
  def change
    change_table :players do |t|
      t.rename :atBat,        :atBats
      t.rename :run,          :runs
      t.rename :hit,          :hits
      t.rename :steal,        :steals
      t.rename :sacrificeFly, :sacrificeFlies
      t.rename :walk,         :walks
      t.rename :bean,         :beans
    end
  end
end
