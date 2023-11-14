class VirtualCompetition::Group::OverallStandings
  def categories
    @group.overall_standing_rows.group_by(&:suits_kind)
  end
end
