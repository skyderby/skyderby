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

require 'rails_helper'

RSpec.describe QualificationRound, type: :model do
  pending "add some examples to (or delete) #{__FILE__}"
end
