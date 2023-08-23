require 'zip'

module Assets
  module SpeedSkydivingCompetitions
    class ScoreboardsController < ApplicationController
      before_action :set_event

      def show
        authorize @event, :download?

        @standings = SpeedSkydivingCompetition::Scoreboard.new(@event)

        zip_stream = Zip::OutputStream.write_buffer do |zip|
          write_files_to_archive(zip)
        end

        zip_stream.rewind
        send_data zip_stream.read,
                  type: 'application/zip',
                  disposition: 'attachment',
                  filename: "category-standings-#{@event.name.parameterize}.zip"
      end

      private

      def write_files_to_archive(zip)
        @standings.categories.each do |category_standings|
          category, standings = category_standings.values_at(:category, :standings)

          category_name = category.name.downcase.parameterize
          filename = "#{category_name}.xml"
          zip.put_next_entry(filename)
          zip.write(render_to_string('show', locals: { category_id: category.id, standings: }))
        end
      end

      def filename
        formatted_date = Time.zone.now.to_date.iso8601
        "#{formatted_date} - #{@event.name.to_param}"
      end

      def set_event
        @event = SpeedSkydivingCompetition.find(params[:speed_skydiving_competition_id])
      end
    end
  end
end
