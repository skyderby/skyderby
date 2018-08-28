class Event < ApplicationRecord
  class Result < ApplicationRecord
    class Submission
      include ActiveModel::Model

      attr_reader :result

      attr_accessor :event_id,
                    :competitor_id,
                    :round_id,
                    :round_name,
                    :penalized,
                    :penalty_size,
                    :penalty_reason,
                    :track_attributes,
                    :jump_range

      validates :competitor, :round, presence: true

      def save
        return false unless valid?

        Event::Result.transaction do
          create_result
          set_jump_range
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
      end

      def result_params
        {
          competitor: competitor,
          round: round,
          penalized: penalized,
          penalty_size: penalty_size,
          penalty_reason: penalty_reason,
          track_attributes: track_attributes,
          track_from: 'from_file'
        }
      end

      def competitor
        @competitor ||= event.competitors.find_by(id: competitor_id)
      end

      def round
        @round ||= event.rounds.find_by(id: round_id) ||
                   event.rounds.find_by(discipline: round_task, number: round_number)
      end

      def event
        @event ||= Event.find(event_id)
      end

      def round_task
        Event::Round.disciplines[round_name.split('-')[0].downcase]
      end

      def round_number
        round_name.split('-')[1]
      end

      def exit_time
        return unless jump_range[:exit_time]

        Time.strptime(jump_range[:exit_time], '%Y-%m-%dT%H:%M:%S.%L %Z')
      end

      def deploy_time
        return unless jump_range[:deploy_time]

        Time.strptime(jump_range[:deploy_time], '%Y-%m-%dT%H:%M:%S.%L %Z')
      end

      def jump_range
        @jump_range || {}
      end

      def penalized
        @penalized ||= false
      end
    end
  end
end
