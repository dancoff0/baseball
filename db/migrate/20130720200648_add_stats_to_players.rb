class AddStatsToPlayers < ActiveRecord::Migration
  def change
    add_column :players, :doubles, :integer
    add_column :players, :triples, :integer
    add_column :players, :totalBases, :integer
    add_column :players, :avg, :float
    add_column :players, :slg, :float
    add_column :players, :obp, :float
    add_column :players, :ops, :float
  end
end
