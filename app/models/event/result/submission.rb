class Event < ApplicationRecord
  class Result < ApplicationRecord
    class Submission
      include ActiveModel::Model
      extend ActiveModel::Naming

      attr_reader :result, :errors

      attr_accessor :event_id,
                    :competitor_id,
                    :round_id,
                    :round_name,
                    :penalty_size,
                    :penalty_reason,
                    :track_file

      attr_writer :competitor_name,
                  :reference_point,
                  :jump_range,
                  :penalized

      validates :competitor, :round, presence: true
      validates :penalty_size, presence: true, if: :penalized

      def initialize(args)
        super

        @errors = ActiveModel::Errors.new(self)
      end

      def save
        return false unless valid?

        Event::Result.transaction do
          create_result
          set_jump_range
          assign_reference_point
        end

        result
      end

      private

      def create_result
        @result = event.results.new result_params
        @result.save!
      end

      def set_jump_range
        return if exit_time.blank? || deploy_time.blank?

        points = PointsQuery.execute(result.track, only: %i[gps_time fl_time])

        relative_exit_time   = points.bsearch { |p| p['gps_time'] >= exit_time }[:fl_time]
        relative_deploy_time = points.bsearch { |p| p['gps_time'] >= deploy_time }[:fl_time]

        @result.track.update! ff_start: relative_exit_time, ff_end: relative_deploy_time

        @result.track_from = 'existent'
        @result.calculate_result
        @result.save!
      end

      def assign_reference_point
        reference_point = find_or_create_reference_point

        return unless reference_point

        assignment = round.reference_point_assignments.find_or_create_by(competitor: competitor)
        assignment.update!(reference_point: reference_point)
      end

      def result_params
        {
          competitor: competitor,
          round: round,
          penalized: penalized,
          penalty_size: penalty_size,
          penalty_reason: penalty_reason,
          track_file: track_file,
          track_from: 'from_file'
        }
      end

      def competitor
        @competitor ||= event.competitors.find_by(id: competitor_id) || competitor_by_name
      end

      def round
        @round ||= event.rounds.find_by(id: round_id) || event.rounds.by_name(round_name)
      end

      def event
        @event ||= Event.find(event_id)
      end

      def competitor_by_name
        event.competitors.joins(:profile).find_by('LOWER(profiles.name) = ?', competitor_name)
      end

      def competitor_name
        @competitor_name.to_s.strip.downcase
      end

      def find_or_create_reference_point
        event.reference_points.find_or_create(reference_point)
      end

      def exit_time
        return unless jump_range[:exit_time]

        Time.strptime(jump_range[:exit_time], '%Y-%m-%dT%H:%M:%S.%L %Z')
      end

      def deploy_time
        return unless jump_range[:deploy_time]

        Time.strptime(jump_range[:deploy_time], '%Y-%m-%dT%H:%M:%S.%L %Z')
      end

      def reference_point
        @reference_point || {}
      end

      def jump_range
        @jump_range || {}
      end

      def penalized
        @penalized.to_s.casecmp?('true')
      end
    end
  end
end
