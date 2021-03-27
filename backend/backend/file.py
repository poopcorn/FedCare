import os

class File:

    def __init__(self, dir, prefix):
        self.dir = dir
        self.prefix = prefix

    def latest_file(self, round_every_file):
        files = os.listdir(self.dir)
        for i in range(len(files)):
            files[i] = files[i].strip(self.prefix)
            files[i] = files[i].strip('.json')
            files[i] = int(files[i].split('_')[0])
        files = sorted(files)
        return self.prefix + str(files[-1]) + '_' + \
               str((int(files[-1]) // round_every_file) * round_every_file + round_every_file - 1) + '.json'
    
    def all_files(self, round_every_file):
        files = os.listdir(self.dir)
        for i in range(len(files)):
            files[i] = files[i].strip(self.prefix)
            files[i] = files[i].strip('.json')
            files[i] = int(files[i].split('_')[0])
        files = sorted(files)
        return files