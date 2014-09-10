class Discipline < ActiveRecord::Base
  has_many :rounds, dependent: :destroy

  def self.distance
    self.find_by_name(:Distance)
  end

  def self.time
    self.find_by_name(:Time)
  end

  def self.speed
    self.find_by_name(:Speed)
  end

end
