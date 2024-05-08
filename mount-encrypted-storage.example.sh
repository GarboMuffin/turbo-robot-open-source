#!/bin/bash

# it is recommended production database be stored on an encrypted volume

set -euf -o pipefail

# set up with:
# fallocate -l 512M /root/encrypted-storage
# dd if=/dev/zero of=/root/encrypted-storage bs=1M count=512
# cryptsetup luksFormat /root/encrypted-storage
# cryptsetup luksOpen /root/encrypted-storage encrypted-storage
# mkfs.ext4 /dev/mapper/encrypted-storage
# cryptsetup luksClose encrypted-storage
# then set config.js's dataPath to /encrypted/discord/

# mount with:
cryptsetup luksOpen /root/encrypted-storage encrypted-storage
mount /dev/mapper/encrypted-storage /encrypted
mkdir -p /encrypted/discord/
