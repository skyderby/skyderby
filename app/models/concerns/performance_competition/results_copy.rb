module PerformanceCompetition::ResultsCopy
  extend ActiveSupport::Concern

  def copy_results_from!(source_event)
    return if source_event == self

    ActiveRecord::Base.transaction do
      sync_rounds_from(source_event)
      sync_reference_points_from(source_event)
      sync_results_from(source_event)
      sync_rounds_completion_from(source_event)
    end
  end

  private

  def sync_rounds_from(source_event)
    source_event.rounds.ordered.find_each do |source_round|
      rounds.find_or_create_by(discipline: source_round.discipline, number: source_round.number)
    end
  end

  def sync_results_from(source_event)
    competitor_mapping = competitors.index_by(&:profile_id)
    round_mapping = rounds.index_by(&:code)

    source_event.results.includes(:competitor, :round).find_each do |source_result|
      target_competitor = competitor_mapping[source_result.competitor.profile_id]
      target_round = round_mapping[source_result.round.code]
      next if target_competitor.blank? || target_round.blank?

      result = target_round.results.find_or_initialize_by(competitor: target_competitor)
      result.assign_attributes(
        source_result.attributes.except('id', 'round_id', 'competitor_id', 'created_at', 'updated_at')
      )
      result.save!
    end

    sync_reference_point_assignments_from(source_event)
  end

  def sync_rounds_completion_from(source_event)
    round_mapping = rounds.index_by(&:code)

    source_event.rounds.find_each do |source_round|
      target_round = round_mapping[source_round.code]
      target_round&.update!(completed_at: source_round.completed_at)
    end
  end

  def sync_reference_points_from(source_event)
    source_event.reference_points.find_each do |source_reference_point|
      reference_points.find_or_create_by(
        latitude: source_reference_point.latitude,
        longitude: source_reference_point.longitude
      ) do |reference_point|
        reference_point.name = source_reference_point.name
      end
    end
  end

  def sync_reference_point_assignments_from(source_event)
    competitor_mapping = competitors.index_by(&:profile_id)
    round_mapping = rounds.index_by(&:code)
    reference_point_mapping = build_reference_point_mapping

    source_assignments = source_event.reference_point_assignments
                                     .includes(:competitor, :round, :reference_point)

    source_assignments.find_each do |source_assignment|
      sync_single_reference_point_assignment(
        source_assignment,
        competitor_mapping,
        round_mapping,
        reference_point_mapping
      )
    end
  end

  def build_reference_point_mapping
    reference_points.index_by { |rp| [rp.latitude, rp.longitude] }
  end

  def sync_single_reference_point_assignment(source_assignment, competitor_mapping, round_mapping,
                                             reference_point_mapping)
    target_competitor = competitor_mapping[source_assignment.competitor.profile_id]
    target_round = round_mapping[source_assignment.round.code]
    target_reference_point = find_target_reference_point(source_assignment.reference_point, reference_point_mapping)

    return if target_competitor.blank? || target_round.blank? || target_reference_point.blank?

    target_round.reference_point_assignments.find_or_create_by(
      competitor: target_competitor,
      reference_point: target_reference_point
    )
  end

  def find_target_reference_point(source_reference_point, reference_point_mapping)
    reference_point_mapping[[
      source_reference_point.latitude,
      source_reference_point.longitude
    ]]
  end
end
