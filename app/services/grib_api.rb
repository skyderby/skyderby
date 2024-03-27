require 'ffi'

module GribApi
  module Stdio
    extend FFI::Library
    ffi_lib FFI::Library::LIBC

    typedef :pointer, :file_pointer
    attach_function :fopen, [:string, :string], :file_pointer
    attach_function :fclose, [:file_pointer], :int
  end

  extend FFI::Library

  # requires adding the path to the eccodes library to the LD_LIBRARY_PATH
  # export LD_LIBRARY_PATH=$LD_LIBRARY_PATH:$(brew --prefix eccodes)/share
  # or:
  # export LD_LIBRARY_PATH="$(brew --prefix eccodes)/share"
  ffi_lib 'eccodes'

  typedef :pointer, :grib_context_p
  typedef :pointer, :grib_handle_p

  # @method grib_context_get_default
  # Get the static default context
  #
  # @return [FFI::Pointer] the default context, NULL it the context is not available
  attach_function :grib_context_get_default, [], :grib_context_p

  # @method grib_context_delete
  # Frees the cached definition files of the context
  #
  # @param c [FFI::Pointer] the context to be deleted
  #   grib_context* c
  # @return [nil] void
  attach_function :grib_context_delete, [:grib_context_p], :void

  # NULL is the default context to be used in the following functions
  def self.default_context = FFI::Pointer.new(0)

  # @method grib_handle_new_from_file
  # Create a handle from a file resource.
  # The file is read until a message is found. The message is then copied.
  # Remember always to delete the handle when it is not needed anymore to avoid
  # memory leaks.
  #
  # @param c [FFI::Pointer] the context from which the handle will be created (NULL for default context)
  # @param f [FFI::Pointer] the file resource
  # @param error [FFI::Pointer] pointer to integer.
  #              error code set if the returned handle is NULL and the end of file is not reached
  # @return [FFI::Pointer] the new handle, NULL if the resource is invalid or a problem is encountered
  attach_function :grib_handle_new_from_file, [:pointer, :pointer, :pointer], :grib_handle_p

  # @method grib_handle_delete
  # Frees a handle, also frees the message if it is not a user message
  #
  # @param h [FFI::Pointer] The handle to be deleted
  #   grib_handle* h
  # @return [Integer] 0 if OK, integer value on error
  attach_function :grib_handle_delete, [:grib_handle_p], :int

  # @method grib_count_in_file
  # Counts the messages contained in a file resource.
  #
  # @param c [FFI::Pointer] the context from which the handle will be created (NULL for default context)
  # @param f [FFI::Pointer] the file resource
  # @param n [FFI::Pointer] the number of messages in the file
  # @return [Integer] 0 if OK, integer value on error
  attach_function :grib_count_in_file, [:grib_context_p, :pointer, :pointer], :int

  # @method grib_get_data
  # Get latitude/longitude and data values.
  # The latitudes, longitudes and values arrays must be properly allocated by the caller.
  # Their required dimension can be obtained by getting the value of the integer key "numberOfPoints".
  #
  # int grib_get_data(const grib_handle* h, double* lats, double* lons, double* values);
  #
  # @param h           : handle from which geography and data values are taken
  # @param lats        : returned array of latitudes
  # @param lons        : returned array of longitudes
  # @param values      : returned array of data values
  # @return            0 if OK, integer value on error
  attach_function :grib_get_data, [:grib_handle_p, :pointer, :pointer, :pointer], :int

  # @method grib_get_long
  # Get a long value from a key, if several keys of the same name are present, the last one is returned
  #
  # @param h [FFI::Pointer] the handle to get the data from
  #   const grib_handle* h
  # @param key [String] the key to be searched
  #   const char* key
  # @param value [FFI::Pointer] the address of a long where the data will be retrieved
  #   long* value
  # @return [Integer] 0 if OK, integer value on error
  attach_function :grib_get_long, [:grib_handle_p, :string, :pointer], :int

  # @method grib_get_double
  # Get a double value from a key, if several keys of the same name are present, the last one is returned
  #
  # @param h [FFI::Pointer] the handle to get the data from
  #   const grib_handle* h
  # @param key [String] the key to be searched
  #   const char* key
  # @param value [FFI::Pointer] the address of a double where the data will be retrieved
  #   double* value
  # @return [Integer] 0 if OK, integer value on error
  attach_function :grib_get_double, [:grib_handle_p, :string, :pointer], :int

  # @method grib_get_float
  # Get a float value from a key, if several keys of the same name are present, the last one is returned
  #
  # @param h [FFI::Pointer] the handle to get the data from
  #   const grib_handle* h
  # @param key [String] the key to be searched
  #   const char* key
  # @param value [FFI::Pointer] the address of a float where the data will be retrieved
  #   float* value
  # @return [Integer] 0 if OK, integer value on error
  attach_function :grib_get_float, [:grib_handle_p, :string, :pointer], :int

  # @method grib_get_string
  # Get a string value from a key. If several keys of the same name are present, the last one is returned.
  #
  # @param h [FFI::Pointer] the handle to get the data from
  #   const grib_handle* h
  # @param key [String] the key to be searched
  #   const char* key
  # @param mesg [FFI::Pointer] the address of a string where the data will be retrieved
  #   char* mesg
  # @param length [FFI::Pointer] the address of a size_t that contains allocated length of the string on input, and that contains the actual length of the string on output
  # @return [Integer] 0 if OK, integer value on error
  attach_function :grib_get_string, [:grib_handle_p, :string, :pointer, :pointer], :int

  # ###
  # The keys iterator is designed to get the key names defined in a message.
  # Key names on which the iteration is carried out can be filtered through their
  # attributes or by the namespace they belong to.

  # @method grib_keys_iterator_new
  # Create a new iterator from a valid and initialised handle.
  #
  # @param h             : the handle whose keys you want to iterate
  # @param filter_flags  : flags to filter out some of the keys through their attributes
  # @param name_space [String] if not null the iteration is carried out only on
  #   keys belonging to the namespace passed. (NULL for all the keys)
  #   https://confluence.ecmwf.int/display/UDOC/What+are+namespaces+-+ecCodes+GRIB+FAQ
  # @return              keys iterator ready to iterate through keys according to filter_flags
  #                      and namespace
  # grib_keys_iterator* grib_keys_iterator_new(grib_handle* h, unsigned long filter_flags, const char* name_space);
  attach_function :grib_keys_iterator_new, [:grib_handle_p, :ulong, :string], :pointer

  # @method grib_keys_iterator_next
  # Step to the next iterator
  #
  # @param kiter         : valid grib_keys_iterator
  # @return              1 if next iterator exists, 0 if no more elements to iterate on
  #
  # int grib_keys_iterator_next(grib_keys_iterator* kiter);
  attach_function :grib_keys_iterator_next, [:pointer], :int

  # @method grib_keys_iterator_delete
  # Delete the iterator.
  # @param kiter         : valid grib_keys_iterator
  # @return              0 if OK, integer value on error
  #
  # int grib_keys_iterator_delete(grib_keys_iterator* kiter);
  attach_function :grib_keys_iterator_delete, [:pointer], :int

  # @method grib_keys_iterator_get_name
  # get the key name from the iterator
  #
  # @param kiter [FFI::Pointer] valid grib_keys_iterator
  #   const grib_keys_iterator* kiter
  # @return [String] key name
  attach_function :grib_keys_iterator_get_name, [:pointer], :string

  # @method grib_keys_iterator_get_string
  # get the key value from the iterator
  #
  # @param kiter [FFI::Pointer] valid grib_keys_iterator
  #   const grib_keys_iterator* kiter
  # @param v [FFI::Pointer] output parameter the address of a string where the data will be retrieved
  #   char* v
  # @param len [FFI::Pointer] output parameter the address of a size_t where the length of the string will be retrieved
  #   size_t* len
  # @return [Integer, String] status 0 if OK, integer value on error
  def self.grib_keys_iterator_get_string(iterator, length = 1024)
    size = FFI::MemoryPointer.new(:size_t)
    size.write_int(length)
    buf = FFI::MemoryPointer.new(:char, length)
    status = _grib_keys_iterator_get_string(iterator, buf, size)

    [status, buf.read_string]
  end
  attach_function :_grib_keys_iterator_get_string, :grib_keys_iterator_get_string, [:pointer, :pointer, :pointer], :int

  # @method grib_nearest_new
  # Create a new nearest neighbour object from a handle, using current geometry.
  #
  # @param h [FFI::Pointer] the handle from which the nearest object will be created
  #   const grib_handle* h
  # @param error [FFI::Pointer] pointer to integer where the error code will be written
  #   int* error
  # @return [FFI::Pointer] the new nearest, NULL if no nearest can be created
  attach_function :grib_nearest_new, [:grib_handle_p, :pointer], :pointer

  GRIB_NEAREST_SAME_GRID  = 1 << 0
  GRIB_NEAREST_SAME_DATA  = 1 << 1
  GRIB_NEAREST_SAME_POINT = 1 << 2

  # @method grib_nearest_find
  # Find the 4 nearest points of a latitude longitude point.
  # The flags are provided to speed up the process of searching. If you are
  # sure that the point you are asking for is not changing from a call
  # to another you can use GRIB_NEAREST_SAME_POINT. The same is valid for
  # the grid. Flags can be used together doing a bitwise OR.
  # The distances are given in kilometres.
  #
  # @param nearest [FFI::Pointer] nearest structure
  #   grib_nearest* nearest
  # @param h [FFI::Pointer] handle from which geography and data values are taken
  #   const grib_handle* h
  # @param inlat [Float] latitude of the point to search for
  #   double inlat
  # @param inlon [Float] longitude of the point to search for
  #   double inlon
  # @param flags [Integer] GRIB_NEAREST_SAME_POINT, GRIB_NEAREST_SAME_GRID
  #   unsigned long flags
  # @param outlats [FFI::Pointer] returned array of latitudes of the nearest points
  #   double* outlats
  # @param outlons [FFI::Pointer] returned array of longitudes of the nearest points
  #   double* outlons
  # @param values [FFI::Pointer] returned array of data values of the nearest points
  #   double* values
  # @param distances [FFI::Pointer] returned array of distances from the nearest points
  #   double* distances
  # @param indexes [FFI::Pointer] returned array of indexes of the nearest points
  #   int* indexes
  # @param len [FFI::Pointer] size of the arrays
  #   size_t* len
  # @return [Integer] 0 if OK, integer value on error
  attach_function :grib_nearest_find, [:pointer, :grib_handle_p, :double, :double, :ulong, :pointer, :pointer, :pointer, :pointer, :pointer, :pointer], :int

  # @method grib_nearest_delete
  # Frees a nearest neighbour object from memory
  #
  # @param nearest [FFI::Pointer] the nearest
  #   grib_nearest* nearest
  # @return [Integer] 0 if OK, integer value on error
  attach_function :grib_nearest_delete, [:pointer], :int

  DataResult = Data.define(:lats, :lons, :values)
  NearestResult = Data.define(:lats, :lons, :values, :distances, :indexes)
  Level = Data.define(:level, :type) do
    def ==(other)
      type == other.type && level == other.level
    end
  end

  def self.open(file_path) = File.new(file_path)

  class File
    def initialize(file_path)
      @file_path = file_path
      @file_pointer = Stdio.fopen(file_path.to_s, 'r')

      ObjectSpace.define_finalizer(self, self.class.finalize(@file_pointer))
    end

    def timestamp
      messages.first&.timestamp
    end

    def messages
      @messages ||= [].tap do |messages|
        loop do
          status = FFI::MemoryPointer.new(:int)
          handle = GribApi.grib_handle_new_from_file(GribApi.default_context, @file_pointer, status)
          break if handle.null?
          raise "Error reading message from file: #{@file_path}, error code: #{status}" if status.read_int != 0

          messages << Message.new(handle)
        end
      end
    end

    def message_count
      count_pointer = FFI::MemoryPointer.new(:int)
      err = GribApi.grib_count_in_file(GribApi.default_context, @file_pointer, count_pointer)
      raise "Error counting messages in file: #{@file_path}, error code: #{err}" if err != 0

      count_pointer.read_int
    end

    def self.finalize(file_pointer)
      proc { Stdio.fclose(file_pointer) }
    end
  end

  class Message
    def initialize(handle)
      @handle = handle

      ObjectSpace.define_finalizer(self, self.class.finalize(@handle))
    end

    def timestamp
      date = read_string_parameter('dataDate')
      time = read_string_parameter('dataTime')
      DateTime.strptime("#{date}#{time}", '%Y%m%d%H%M')
    end

    def number_of_points
      read_numeric_parameter('numberOfPoints')
    end

    def variable
      read_string_parameter('cfName')
    end

    def level
      Level.new(level: read_numeric_parameter('level'), type: read_string_parameter('typeOfLevel'))
    end

    # returns NearestResult
    #   lats: array of latitudes of the nearest four points
    #   lons: array of longitudes of the nearest four points
    #   values: array of data values of the nearest four points
    #   distances: array of distances from the nearest four points
    # @return [NearestResult]
    def nearest_points(lat, lon)
      status = FFI::MemoryPointer.new(:size_t)
      neighbour = GribApi.grib_nearest_new(@handle, status)

      array_length = 4
      size = FFI::MemoryPointer.new(:size_t)
      size.write_int(array_length)
      out_lats = FFI::MemoryPointer.new(:double, array_length)
      out_lons = FFI::MemoryPointer.new(:double, array_length)
      values = FFI::MemoryPointer.new(:double, array_length)
      distances = FFI::MemoryPointer.new(:double, array_length)
      indexes = FFI::MemoryPointer.new(:int, array_length)

      status = GribApi.grib_nearest_find(
        neighbour,
        @handle,
        lat,
        lon,
        GRIB_NEAREST_SAME_POINT,
        out_lats,
        out_lons,
        values,
        distances,
        indexes,
        size
      )
      raise "Error finding nearest points, error code: #{status}" if status != 0

      NearestResult.new(
        lats: out_lats.read_array_of_double(array_length),
        lons: out_lons.read_array_of_double(array_length),
        values: values.read_array_of_double(array_length),
        distances: distances.read_array_of_double(array_length),
        indexes: indexes.read_array_of_int(array_length)
      )
    ensure
      GribApi.grib_nearest_delete(neighbour)
    end

    def keys
      iterator = GribApi.grib_keys_iterator_new(@handle, 0, 'time')
      keys = []
      while GribApi.grib_keys_iterator_next(iterator) == 1
        name = GribApi.grib_keys_iterator_get_name(iterator)
        status, value = GribApi.grib_keys_iterator_get_string(iterator)
        keys << [name, value]
      end
      keys
    ensure
      GribApi.grib_keys_iterator_delete(iterator)
    end

    def data
      length = number_of_points
      lats = FFI::MemoryPointer.new(:double, length)
      lons = FFI::MemoryPointer.new(:double, length)
      values = FFI::MemoryPointer.new(:double, length)

      status = GribApi.grib_get_data(@handle, lats, lons, values)
      raise "Error getting data, error code: #{status}" if status != 0

      DataResult.new(
        lats: lats.read_array_of_double(length),
        lons: lons.read_array_of_double(length),
        values: values.read_array_of_double(length)
      )
    end

    def read_string_parameter(key, length = 1024)
      size = FFI::MemoryPointer.new(:size_t)
      size.write_int(length)
      value = FFI::MemoryPointer.new(:char, length)
      status = GribApi.grib_get_string(@handle, key, value, size)
      raise "Error reading #{key}, error code: #{status}" if status != 0

      value.read_string
    end

    def read_numeric_parameter(key, type = :int)
      value = FFI::MemoryPointer.new(type)

      case type
      when :int
        status = GribApi.grib_get_long(@handle, key, value)
        raise "Error reading #{key}, error code: #{status}" if status != 0

        value.read_int
      when :double
        status = GribApi.grib_get_double(@handle, key, value)
        raise "Error reading #{key}, error code: #{status}" if status != 0

        value.read_double
      when :float
        status = GribApi.grib_get_float(@handle, key, value)
        raise "Error reading #{key}, error code: #{status}" if status != 0

        value.read_float
      end
    end

    def self.finalize(handle)
      proc { GribApi.grib_handle_delete(handle) }
    end
  end
end
