class ChangeHomeRunColumnInPlayers < ActiveRecord::Migration
  def change
    change_table :players do |t|
      t.rename :homeRun,        :homeRuns
    end
  end
end
