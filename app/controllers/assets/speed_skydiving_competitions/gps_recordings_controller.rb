require 'zip'

module Assets
  module SpeedSkydivingCompetitions
    class GpsRecordingsController < ApplicationController
      before_action :set_event

      def show
        authorize @event, :download?

        zip_stream = Zip::OutputStream.write_buffer do |zip|
          write_files_to_archive(zip)
        end

        zip_stream.rewind
        send_data zip_stream.read,
                  type: 'application/zip',
                  disposition: 'attachment',
                  filename: "files-#{@event.name.parameterize}.zip"
      end

      private

      def write_files_to_archive(zip)
        results.find_each do |result|
          file = result.track.track_file.file
          competitor = result.competitor
          round = result.round
          filename = [
            competitor.assigned_number,
            competitor.name.tr(' ', '_'),
            "Round_#{round.number}",
            file.original_filename
          ].select(&:present?).join('_')
          local_file = file.download

          zip.put_next_entry(filename)
          zip.write(local_file.read)
          local_file.close!
        end
      end

      def results = @event.results

      def set_event
        @event = SpeedSkydivingCompetition.find(params[:speed_skydiving_competition_id])
      end
    end
  end
end
