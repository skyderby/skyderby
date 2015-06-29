module Skyderby
  module Tracks
    class FileProcessor
      def initialize(path_to_file)
        @path_to_file = path_to_file
        @extension = File.extname path_to_file

        file_data = File.new(@path_to_file).read
        @adapter =
          Skyderby::Parsers::ParserSelector.new.execute(file_data, @extension)
      end

      def read_segments
        @adapter.read_segments
      end

      def read_track_data(index = 0)
        @adapter.parse(index)
      end
    end
  end
end
