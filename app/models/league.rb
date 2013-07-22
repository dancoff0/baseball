class League < ActiveRecord::Base
  belongs_to :season
  has_many :divisions
end
