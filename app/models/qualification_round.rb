# == Schema Information
#
# Table name: qualification_rounds
#
#  id            :integer          not null, primary key
#  tournament_id :integer
#  order         :integer
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#

class QualificationRound < ActiveRecord::Base
  belongs_to :tournament
  has_many :qualification_jumps
end
