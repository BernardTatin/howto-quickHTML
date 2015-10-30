#!/bin/sh

scriptname=$(basename $0)
here=$(dirname $0)

dohelp () {
    cat << DOHELP
${scriptname} --help|-h : this text
${scriptname} : excute 'lessc main.less main.css' in each
                sub directory in which ther is a 'main.less' file
DOHELP
    exit 0
}

if [ $# -ne 0 ]
then
    case $1 in
        --help|-h)
            dohelp
            ;;
        *)
            echo "Bad argument"
            dohelp
            ;;
    esac
fi

for f in $(find $here -name "main.less")
do
    d=$(dirname $f)
    cd $d
    echo "in $d ..."
    lessc main.less main.css
done
