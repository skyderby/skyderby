class CreateVirtualCompetitionGroupAnnualStandingRows < ActiveRecord::Migration[7.0]
  def change
    create_view :virtual_competition_group_annual_standing_rows
  end
end
