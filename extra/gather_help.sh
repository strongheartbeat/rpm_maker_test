#!/bin/bash
CMDS=$( find . ! \( -name '*.sh' -prune \) -type f -maxdepth 1 -mindepth 1 -print )
HELP_FILE=Signage_Command_help.txt
if [ -e ${HELP_FILE} ] ; then
    echo "Removing existing text file..."
    rm ${HELP_FILE}
fi
for CMD in ${CMDS}; do
# echo "CMD: ${CMD}"
    if [[ ${CMD} =~ ares* ]]; then
        echo "+-------------- ${CMD} help -----------+"
        echo "+-------------- ${CMD} help -----------+" >> ${HELP_FILE}
        ${CMD} -h >> ${HELP_FILE}
    fi
done

